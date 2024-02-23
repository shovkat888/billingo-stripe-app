# Stripe App for Billingo Invoicing

## Project

### Environment

install stripe cli 
install stripe sdk

 Backend is already deployed on render. You can customize backend url in **stripe-app.json**.
 Initial API endpoint is: https://billingo-stripe-backend.onrender.com/api/v1/billingo/
 

### Run Project in Dev Mode

Run project using following command

    stripe apps start --manifest stripe-app.dev.json

### Run Project in Live Mode
Run project using following command

    stripe apps start

### App Uploads
Once you need to upgrade the app, you can update code and upload the app into stripe account in test mode using following command.
    stripe apps upload

## Guide
This app is used to generate invoice for billingo. After you install the app from marketplace, you have to add your Billingo **API key** on settings view in the app or payment details page in stripe account.

> And your **API key** should have subscription for creating invoice file.