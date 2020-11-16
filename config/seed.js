const models = require('../models');

models.once('open', async function() {
  console.log('Seeding DB...');
  // This kills everything
  //await models.mongoose.connection.db.dropDatabase();

  // Just add admins
  await models.Agent.remove({});
  console.log('Old agents removed');

  await models.Agent.create({ email: 'fake@example.com', password: 'secret' });

  console.log('Cheerio!');
  process.exit(0);
});

