basic-crypto-invoicing
======================

Creates a unique-to-invoice crypto wallet and general purpose request for payment.

# Setup

Clone repository and,

```
npm install
cp .env.example .env
```

The `.env.example` config is sufficient for development and testing.

# Test

Start a MongoDB development server:

```
docker run --name dev-mongo -p 27017:27017 -d mongo
```

Run all the tests:

```
npm test
```

Run one set of tests:

```
NODE_ENV=test npx jasmine spec/features/indexSpec.js
```


