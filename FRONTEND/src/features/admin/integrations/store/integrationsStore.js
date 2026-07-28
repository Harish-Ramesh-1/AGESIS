import { create } from 'zustand'
import {
  fetchPaymentGateway,
  regeneratePaymentGatewayKey,
  testPaymentGatewayConnection,
  fetchSmsConfig,
  testSms,
  fetchEmailConfig,
  testEmail,
  fetchApiKeys,
  generateApiKey,
  revokeApiKey,
  fetchWebhooks,
} from '../services/integrationsService'

export const useIntegrationsStore = create((set, get) => ({
  // Payment Gateway
  gatewayStatus: 'idle',
  gatewayError: null,
  gateway: null,
  gatewayActionStatus: 'idle',
  gatewayTestStatus: 'idle',
  gatewayTestResult: null,

  fetchGateway: async () => {
    if (get().gatewayStatus === 'loading') return
    set({ gatewayStatus: 'loading', gatewayError: null })
    try {
      const gateway = await fetchPaymentGateway()
      set({ gatewayStatus: 'success', gateway })
    } catch (error) {
      set({ gatewayStatus: 'error', gatewayError: error.message })
    }
  },
  regenerateGatewayKey: async () => {
    set({ gatewayActionStatus: 'loading' })
    try {
      const gateway = await regeneratePaymentGatewayKey()
      set({ gatewayActionStatus: 'success', gateway })
    } catch (error) {
      set({ gatewayActionStatus: 'error', gatewayError: error.message })
    }
  },
  testGatewayConnection: async () => {
    set({ gatewayTestStatus: 'loading', gatewayTestResult: null })
    try {
      const result = await testPaymentGatewayConnection()
      set({ gatewayTestStatus: 'success', gatewayTestResult: result })
    } catch (error) {
      set({ gatewayTestStatus: 'error', gatewayTestResult: { success: false, message: error.message } })
    }
  },

  // SMS
  smsStatus: 'idle',
  smsError: null,
  sms: null,
  smsTestStatus: 'idle',
  smsTestError: null,

  fetchSms: async () => {
    if (get().smsStatus === 'loading') return
    set({ smsStatus: 'loading', smsError: null })
    try {
      const sms = await fetchSmsConfig()
      set({ smsStatus: 'success', sms })
    } catch (error) {
      set({ smsStatus: 'error', smsError: error.message })
    }
  },
  sendTestSms: async (phoneNumber) => {
    set({ smsTestStatus: 'loading', smsTestError: null })
    try {
      await testSms(phoneNumber)
      const sms = await fetchSmsConfig()
      set({ smsTestStatus: 'success', sms })
    } catch (error) {
      set({ smsTestStatus: 'error', smsTestError: error.message })
    }
  },
  resetSmsTestStatus: () => set({ smsTestStatus: 'idle', smsTestError: null }),

  // Email
  emailStatus: 'idle',
  emailError: null,
  email: null,
  emailTestStatus: 'idle',
  emailTestError: null,

  fetchEmail: async () => {
    if (get().emailStatus === 'loading') return
    set({ emailStatus: 'loading', emailError: null })
    try {
      const email = await fetchEmailConfig()
      set({ emailStatus: 'success', email })
    } catch (error) {
      set({ emailStatus: 'error', emailError: error.message })
    }
  },
  sendTestEmail: async (address) => {
    set({ emailTestStatus: 'loading', emailTestError: null })
    try {
      await testEmail(address)
      const email = await fetchEmailConfig()
      set({ emailTestStatus: 'success', email })
    } catch (error) {
      set({ emailTestStatus: 'error', emailTestError: error.message })
    }
  },
  resetEmailTestStatus: () => set({ emailTestStatus: 'idle', emailTestError: null }),

  // API keys & webhooks
  apiKeysStatus: 'idle',
  apiKeysError: null,
  apiKeys: [],
  apiKeyActionStatus: 'idle',

  webhooksStatus: 'idle',
  webhooksError: null,
  webhooks: [],

  fetchApiWebhooks: async () => {
    if (get().apiKeysStatus === 'loading') return
    set({ apiKeysStatus: 'loading', apiKeysError: null, webhooksStatus: 'loading', webhooksError: null })
    try {
      const [apiKeys, webhooks] = await Promise.all([fetchApiKeys(), fetchWebhooks()])
      set({ apiKeysStatus: 'success', apiKeys, webhooksStatus: 'success', webhooks })
    } catch (error) {
      set({ apiKeysStatus: 'error', apiKeysError: error.message, webhooksStatus: 'error', webhooksError: error.message })
    }
  },
  createApiKey: async (label) => {
    set({ apiKeyActionStatus: 'loading' })
    try {
      const apiKeys = await generateApiKey(label)
      set({ apiKeyActionStatus: 'success', apiKeys })
    } catch (error) {
      set({ apiKeyActionStatus: 'error', apiKeysError: error.message })
    }
  },
  removeApiKey: async (id) => {
    set({ apiKeyActionStatus: 'loading' })
    try {
      const apiKeys = await revokeApiKey(id)
      set({ apiKeyActionStatus: 'success', apiKeys })
    } catch (error) {
      set({ apiKeyActionStatus: 'error', apiKeysError: error.message })
    }
  },
}))
