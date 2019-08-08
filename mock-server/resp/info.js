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
    USD: {
      enabled: true,
      authentication_required: true,
      fee_fixed: 5,
      fee_percent: 0,
      min_amount: 0.1,
      max_amount: 1000,
      types: {
        bank_account: {
          fields: {
            dest: { description: "your bank account number" },
            dest_extra: { description: "your routing number" },
            bank_branch: { description: "address of your bank branch" },
            phone_number: {
              description: "your phone number in case there's an issue"
            }
          }
        },
        cash: {
          fields: {
            dest: {
              description:
                "your email address. Your cashout PIN will be sent here. If not provided, your account's default email will be used",
              optional: true
            }
          }
        }
      }
    },
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
