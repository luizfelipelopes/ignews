
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { query as q } from "faunadb";
import { fauna } from "../../services/fauna";
import { stripe } from "../../services/stripe";

// Cria tipagem pra usuario
type User = {
    ref : {
        id: string;
    }

    data : {
        stripe_customer_id: string;
    }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {

    // Se requisição é POST
    if(req.method === 'POST') {

        const session = await getSession({ req }); // recupera session

        // busca no DB usuario pelo email que tem na session
        const user = await fauna.query<User>(
            q.Get(
                q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(session.user.email)
                )
            )
        )

        // atribui valor id de customer do stripe caso tenha
        let customerId = user.data.stripe_customer_id;

        // se nao é cadastrado no stripe realiza cadastro
        if(!customerId) {

            // Cadastra usuário logado no stripe
            const stripeCustomer = await stripe.customers.create({
                email: session.user.email
            });

            // atualiza no DB o id do usuario no stripe
            await fauna.query(
                q.Update(
                    q.Ref(q.Collection('users'), user.ref.id),
                    {
                        data: {
                            stripe_customer_id: stripeCustomer.id
                        }
                    }
                )
            )

            // atribui valor id de customer do stripe
            customerId = stripeCustomer.id;

        }

        // cria Checkout session do Stripe
        const stripCheckoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            line_items: [
                { price: 'price_1KJaoxKHMVZBEmtpn0w3cbpx', quantity: 1}
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: process.env.STRIPE_SUCCESS_URL,
            cancel_url: process.env.STRIPE_CANCEL_URL
        })

        // Retorna sucesso da requisicao POST com o valor do id da sessao do Checkout do Stripe
        return res.status(200).json({ sessionId: stripCheckoutSession.id })

    } else {
        // Informa que somente o metodo POST é permitido nessa requisicao
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method not allowed');
    }
}