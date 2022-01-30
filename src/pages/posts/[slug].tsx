import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { RichText } from "prismic-dom";
import { getPrismicClient } from "../../services/prismic";

import styles from "./post.module.scss";

// Tipa o post de props
interface PostProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    }
}

export default function Post({ post }: PostProps) {
    return(
        <>
            <Head>
                <title>{post.title} | Ignews</title>
            </Head>
            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>
                    <div
                    className={styles.postContent}
                    dangerouslySetInnerHTML={{ __html:post.content }} />
                    {/* dangerouslySetInnerHTML só pode ser usado se vc sabe que o conteúdo
                    já é tratado contra riscos de stauq (Sql injection, etc) */}
                </article>
            </main>
        </>

    );
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {

    const session = await getSession({ req }); // Recupera sessão
    const { slug } = params; // Recupera slug passado como parametro

    console.log(session);

    // Caso nao tenha subscrição ativa redireciona para Home
    if(!session?.activeSubscription) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    const prismic = getPrismicClient(req); // recupera o service prismic

    const response = await prismic.getByUID('post', String(slug), {}); // recupera o post com o slug

    // Formata as informações que serão utilizadas no post
    const post = {
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    // retorna as informaçãoes dos posts em props
    return {
        props: {
            post
        }
    }

}