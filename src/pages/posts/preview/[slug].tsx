import { GetStaticPaths, GetStaticProps } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { RichText } from "prismic-dom";
import { useEffect } from "react";
import { getPrismicClient } from "../../../services/prismic";

import styles from "../post.module.scss";

// Tipa o post de props
interface PostPreviewProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    }
}

export default function PostPreview({ post }: PostPreviewProps) {

    const { data: session} = useSession();
    const router = useRouter();

    // Se usuario tiver inscricao ativa ele é
    // redireionado para o post completp
    useEffect(() => {

        if(session?.activeSubscription) {
            router.push(`/posts/${post.slug}`)
        }
    }, [session])

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
                    className={`${styles.postContent} ${styles.previewContent}` }
                    dangerouslySetInnerHTML={{ __html:post.content }} />
                    {/* dangerouslySetInnerHTML só pode ser usado se vc sabe que o conteúdo
                    já é tratado contra riscos de stauq (Sql injection, etc) */}

                    <div className={styles.continueReading}>
                        Wanna continue reading ?
                        <Link href="/">
                            <a> Subscribe now 🤗</a>
                        </Link>
                    </div>

                </article>
            </main>
        </>

    );
}


export const getStaticPaths: GetStaticPaths = async() => {

    return {
        paths: [], // quais previews de post eu quero gerar durante a build
        fallback: 'blocking' // true, false or blocking
    }
}

// é getStaticProps pois preview não precisa verificar se o usuario tem assinatura ativa.
// É um conteudo gratuito. Toda página q pode ser pública, pode ser estática
export const getStaticProps: GetStaticProps = async ({ params }) => {

    const { slug } = params; // Recupera slug passado como parametro

    const prismic = getPrismicClient(); // recupera o service prismic

    const response = await prismic.getByUID('post', String(slug), {}); // recupera o post com o slug

    // Formata as informações que serão utilizadas no post
    const post = {
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content.splice(0, 1)),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    // retorna as informações dos posts em props
    return {
        props: {
            post
        },
        revalidate: 60 * 30, // 30 minutes
    }

}