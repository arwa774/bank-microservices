const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    status: String
  }

  type Account {
    id: ID!
    userId: String!
    balance: Float!
    type: String!
  }

  type Transaction {
    id: ID!
    type: String!
    amount: Float!
    description: String
    date: String
  }

  type Notification {
    id: ID!
    userId: String!
    message: String!
    read: Boolean!
    date: String
  }

  type StatusResponse {
    success: Boolean!
    message: String
  }

  type Query {
    user(id: ID!): User
    users: [User]
    account(id: ID!): Account
    transactions(accountId: ID!): [Transaction]
    notifications(userId: ID!): [Notification]
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String!): User
    createAccount(userId: ID!, type: String): Account
    deposit(accountId: ID!, amount: Float!, description: String): Account
    withdraw(accountId: ID!, amount: Float!, description: String): Account
    markAsRead(notificationId: ID!): StatusResponse
  }
`;

module.exports = typeDefs;