// Quick syntax check - loads all modules without starting server
process.env.FIREBASE_PROJECT_ID = 'test';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test.com';
process.env.FIREBASE_PRIVATE_KEY = 'dummy';
process.env.SITE_URL = 'https://rukncoupons.com';

try {
    require('./src/services/seo.service');
    console.log('✅ seo.service OK');
    require('./src/services/schema.service');
    console.log('✅ schema.service OK');
    require('./src/services/rule-engine.service');
    console.log('✅ rule-engine.service OK');
    require('./src/services/auto-link.service');
    console.log('✅ auto-link.service OK');
    require('./src/controllers/home.controller');
    console.log('✅ home.controller OK');
    require('./src/controllers/stores.controller');
    console.log('✅ stores.controller OK');
    require('./src/controllers/store.controller');
    console.log('✅ store.controller OK');
    require('./src/controllers/coupons.controller');
    console.log('✅ coupons.controller OK');
    require('./src/controllers/blog.controller');
    console.log('✅ blog.controller OK');
    require('./src/controllers/sitemap.controller');
    console.log('✅ sitemap.controller OK');
    require('./src/controllers/static.controller');
    console.log('✅ static.controller OK');
    require('./src/controllers/api.controller');
    console.log('✅ api.controller OK');
    require('./src/routes/index');
    console.log('✅ routes/index OK');
    console.log('\n🎉 All modules loaded successfully!');
} catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
}
