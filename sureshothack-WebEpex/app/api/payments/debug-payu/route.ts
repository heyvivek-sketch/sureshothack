import { NextRequest, NextResponse } from 'next/server';
import { generatePayUHash, verifyPayUSignature, getPayUMerchantSalt } from '@/lib/utils/payu';
import type { PayUVerifyRequest } from '@/lib/types/payu';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      hash,
      status,
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
    } = body;

    // Basic validation
    if (!txnid || !amount || !productinfo || !firstname || !email) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const salt = getPayUMerchantSalt();

    // Ensure amount is formatted like PayU expects
    const formattedAmount = Number(amount).toFixed(2);

    // Compute the order/request hash using the same function used in production
    const generatedHash = generatePayUHash(
      txnid,
      formattedAmount,
      productinfo,
      firstname,
      email,
      salt
    );

    // If a hash and status are provided (i.e., a response from PayU), verify signature
    let verifyResult: { verified: boolean; expectedHash?: string } | null = null;
    if (hash && status) {
      const verifyReq: PayUVerifyRequest = {
        txnid,
        amount: formattedAmount,
        productinfo,
        firstname,
        email,
        status,
        hash,
      };
      const ok = verifyPayUSignature(verifyReq, salt);
      verifyResult = { verified: ok, expectedHash: generatedHash };
    }

    return NextResponse.json({
      success: true,
      payload: { txnid, amount: formattedAmount, productinfo, firstname, email, udf1, udf2, udf3, udf4, udf5 },
      generatedHash,
      verifyResult,
    });
  } catch (error) {
    console.error('PayU debug endpoint error:', error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Internal error' }, { status: 500 });
  }
}
