import { fauna } from "../../../services/fauna";
import { query as q } from "faunadb";
import { stripe } from "../../../services/stripe";

//_lib => o undeline indica que a pasta não ser tratada como uma rota
export async function saveSubscription(
    subscriptionId: string,
    customerId: string,
    createAction = false,
){
    //buscar o user no FaunaDB com o id do customerId
    //salvar os dados da subscription do user no FaunaDB
    // console.log(subscriptionId, customerId);
    const userRef = await fauna.query(
      q.Select(
        "ref",
        q.Get(q.Match(q.Index("user_by_stripe_customer_id"),
         customerId)
         )
      )
    );

    //buscando todos os dados da subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);


    //salvando os dados da subscription no FaunaDB
    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,
    }

   if(createAction){
    await fauna.query(
        q.Create(q.Collection("subscriptions"), { data: subscriptionData })
      );
   }else{
        await fauna.query(
            q.Replace(
                q.Select(
                    'ref',
                    q.Get(
                        q.Match(
                            q.Index('subscription_by_id'),
                            subscriptionId,
                        )
                    )
                ),
                { data: subscriptionData }
            ),            
        )
   }

}