require('dotenv').config();
const {test, expect} = require('@playwright/test');

test('PUI place order', async ({page}) => {
    await page.goto('http://woocommerce-paypal-payments.ddev.site:8080/product/product');
    await page.locator('.single_add_to_cart_button').click();

    await page.goto('http://woocommerce-paypal-payments.ddev.site:8080/checkout/');
    await page.fill('#billing_first_name', 'John');
    await page.fill('#billing_last_name', 'Doe');
    await page.selectOption('select#billing_country', 'DE');
    await page.fill('#billing_address_1', 'Badensche Str. 24');
    await page.fill('#billing_postcode', '10715');
    await page.fill('#billing_city', '10715');
    await page.fill('#billing_phone', '1234567890');
    await page.fill('#billing_email', process.env.CUSTOMER_EMAIL);

    await page.click("text=Pay Upon Invoice");
    await page.locator('#billing_birth_date').fill('2000-05-25');

    await Promise.all([
        page.waitForNavigation(),
        page.locator('#place_order').click(),
    ]);

    const title = await page.locator('.entry-title');
    await expect(title).toHaveText('Order received');
});
