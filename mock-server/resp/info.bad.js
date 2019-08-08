module.exports = {
  deposit: {
    USD: {
      enabled: true,
      authentication_required: true,
      fee_fixed: 5,
      fee_percent: 1,
      min_amount: 0.1,
      max_amount: 1000,
      fields: {
        email_address: {
          description: "your email address for transaction status updates",
          optional: true
        },
        amount: {
          description: "amount in USD that you plan to deposit"
        },
        type: {
          description: "type of deposit to make",
          choices: ["SEPA", "SWIFT", "cash"]
        }
      }
    },
    ETH: {
      enabled: true,
      authentication_required: false,
      fee_fixed: 0.002,
      fee_percent: 0
    }
  },
  withdraw: {
    ETH: {
      enabled: false
    }
  },
  fee: {
    enabled: false
  },
  transactions: {
    enabled: true,
    authentication_required: true
  },
  transaction: {
    enabled: false,
    authentication_required: true
  }
};
