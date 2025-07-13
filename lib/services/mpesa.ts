import { supabase } from '../supabase';

const MPESA_API_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
const CONSUMER_KEY = process.env.EXPO_PUBLIC_MPESA_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.EXPO_PUBLIC_MPESA_CONSUMER_SECRET || '';
const MPESA_PASSKEY = process.env.EXPO_PUBLIC_MPESA_PASSKEY || '';

interface STKPushRequest {
    phoneNumber: string;
    amount: number;
    accountReference: string;
    description: string;
    qrCodeId: string;
}

export const initiateSTKPush = async (request: STKPushRequest) => {
    try {
        // Get M-Pesa access token
        const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
        const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });

        if (!tokenResponse.ok) {
            throw new Error('Failed to get access token from M-Pesa');
        }

        const { access_token } = await tokenResponse.json();

        if (!access_token) {
            throw new Error('No access token received from M-Pesa');
        }

        // Format phone number (ensure it starts with 254)
        const formattedPhone = request.phoneNumber.startsWith('0')
            ? `254${request.phoneNumber.substring(1)}`
            : request.phoneNumber.startsWith('+')
                ? request.phoneNumber.substring(1)
                : request.phoneNumber;

        // Generate password
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const businessShortCode = '174379'; // Test business shortcode
        const password = Buffer.from(`${businessShortCode}${MPESA_PASSKEY}${timestamp}`).toString('base64');

        // Make STK push request
        const response = await fetch(MPESA_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                BusinessShortCode: businessShortCode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: Math.floor(request.amount), // Ensure amount is an integer
                PartyA: formattedPhone,
                PartyB: businessShortCode,
                PhoneNumber: formattedPhone,
                CallBackURL: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/mpesa-callback`,
                AccountReference: request.accountReference,
                TransactionDesc: request.description
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.errorMessage || 'Failed to initiate STK push');
        }

        // Save transaction details to database
        const { data: transaction, error } = await supabase
            .from('transactions')
            .insert([{
                qr_code_id: request.qrCodeId,
                amount: request.amount,
                phone_number: formattedPhone,
                mpesa_receipt_number: result.CheckoutRequestID || null,
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            throw new Error('Failed to save transaction details');
        }

        return {
            success: true,
            data: {
                ...result,
                transactionId: transaction?.id
            }
        };
    } catch (error: any) {
        console.error('STK Push Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to initiate payment'
        };
    }
};
