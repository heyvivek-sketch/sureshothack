import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'INR' } = body;

    if (!amount || amount < 100) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid amount. Minimum amount is ₹1 (100 paise)',
        },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: amount, // Amount in paise
      currency: currency,
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create order',
      },
      { status: 500 }
    );
  }
}

