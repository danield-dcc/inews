import { signIn, useSession } from 'next-auth/react';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss'

interface SubscribeButtonProps {
    priceId: string;
}

//3 lugares do next-auth que pode user as chaves de segurança
//getServerSideProps (SSR)
//getStaticProps (SSR)
//API Routes

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
    const { data: session } = useSession();

    async function handleSubscribe() {
        if(!session) {
            signIn('github')
            return;
        }

        //criação da checkout session
        try {                                   //aqui a rota é o nome do arquivo
            const response = await api.post('/subscribe');

            const { sessionId } = response.data;

            const stripe = await getStripeJs();

            await stripe.redirectToCheckout({sessionId: sessionId});

        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    }

    return (
        <button
        type="button"
        className={styles.subscribeButton}
        onClick={handleSubscribe}
        >
            Subscribe now
        </button>
    );
}