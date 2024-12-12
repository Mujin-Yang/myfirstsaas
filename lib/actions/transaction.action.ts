'use server'
// server 是 api 路由的一种替代；我们可以不用很多 API route

import Stripe from 'stripe'
import {redirect} from "next/navigation";
import {handleError} from "@/lib/utils";
import {connectToDatabase} from "@/lib/database/mongoose";
import {updateCredits} from "@/lib/actions/user.actions";
import Transaction from "@/lib/database/models/transaction.model";

export async function checkoutCredits(transaction: CheckoutTransactionParams) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const amount = Number(transaction.amount)*100;
    const session = await stripe.checkout.sessions.create({
        line_items:[{
            price_data:{
                currency:"usd",
                unit_amount:amount,
                product_data:{
                    name:transaction.plan,
                    }
                },
            quantity:1
            }
        ],
        metadata:{
            plan: transaction.plan,
            credits: transaction.credits,
            buyerId: transaction.buyerId,
        },
        mode:'payment',
        success_url:`${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
        cancel_url:`${process.env.NEXT_PUBLIC_SERVER_URL}/`,
    })
    redirect(session.url!)
}

export async function createTransaction(transaction: CreateTransactionParams) {
    try{
        await connectToDatabase();
        const newTransaction = await Transaction.create({
            ...transaction,
            buyer:transaction.buyerId,
        });
        await updateCredits(transaction.buyerId,transaction.credits)
        return JSON.parse(JSON.stringify(newTransaction));
    }catch(error){
        handleError(error);
    }
}