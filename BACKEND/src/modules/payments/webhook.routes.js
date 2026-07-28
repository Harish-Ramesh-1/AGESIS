import { Router } from 'express'
import crypto from 'crypto'
import express from 'express'
import { supabaseAdmin } from '../../config/supabaseClient.js'
import { env } from '../../config/env.js'
import { notifyUser } from '../notifications/notifications.service.js'

export const razorpayWebhookRouter = Router()

razorpayWebhookRouter.post('/', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature']
    if (env.razorpayWebhookSecret) {
      const expected = crypto.createHmac('sha256', env.razorpayWebhookSecret).update(req.body).digest('hex')
      if (expected !== signature) return res.status(400).json({ message: 'Invalid webhook signature' })
    }

    const payload = JSON.parse(req.body.toString('utf8'))
    const event = payload.event
    const paymentEntity = payload.payload?.payment?.entity

    if (event === 'payment.captured' && paymentEntity) {
      const { data: payment } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('gateway_order_id', paymentEntity.order_id)
        .maybeSingle()
      if (payment && payment.status !== 'success') {
        await supabaseAdmin
          .from('payments')
          .update({ status: 'success', gateway_payment_id: paymentEntity.id, verified_at: new Date().toISOString(), paid_at: new Date().toISOString() })
          .eq('id', payment.id)
        if (payment.due_id) {
          const { data: due } = await supabaseAdmin.from('dues').select('*').eq('id', payment.due_id).single()
          if (due) {
            const newPaid = Number(due.amount_paid) + Number(payment.amount)
            await supabaseAdmin
              .from('dues')
              .update({ amount_paid: newPaid, status: newPaid >= Number(due.amount_due) ? 'paid' : 'partially_paid' })
              .eq('id', due.id)
          }
        }
        await notifyUser({ studentId: payment.student_id, title: 'Payment received', message: `Your payment of ${payment.amount} was successful.`, type: 'payment' })
      }
    }

    if (event === 'payment.failed' && paymentEntity) {
      await supabaseAdmin
        .from('payments')
        .update({ status: 'failed', failure_reason: paymentEntity.error_description || 'Payment failed' })
        .eq('gateway_order_id', paymentEntity.order_id)
    }

    res.json({ status: 'ok' })
  } catch (error) {
    console.error('[razorpay webhook] error', error.message)
    res.status(500).json({ message: 'Webhook processing failed' })
  }
})
