import {createClient} from '@prismicio/client';


export function getPrismicClient(req?: unknown) {

    const prismic = createClient(process.env.PRISMIC_ENDPOINT,{accessToken: process.env.PRISMIC_ACESS_TOKEN})

    prismic.enableAutoPreviewsFromReq(req);

    return prismic;
}