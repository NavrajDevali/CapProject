// Generates fresh unique test data for every test run
export const dataFactory = {

    user(overrides = {}) {
      const uid = Date.now();
      return {
        firstName: `Test_${uid}`,
        lastName:  'User',
        age:       25,
        email:     `test_${uid}@example.com`,
        phone:     '+1-555-0100',
        username:  `testuser_${uid}`,
        password:  'Password123',
        gender:    'male',
        ...overrides,
      };
    },
  
    product(overrides = {}) {
      const uid = Date.now();
      return {
        title:    `Test Product ${uid}`,
        price:    99.99,
        stock:    10,
        brand:    'TestBrand',
        category: 'laptops',
        ...overrides,
      };
    },
  
  };
  