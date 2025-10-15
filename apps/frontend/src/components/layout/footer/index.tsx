
import { getSdk } from "@/gql/client";
import { Locales } from "@gql/graphql"
import { GenericContext, CmsContentArea, RichText } from "@remkoj/optimizely-cms-react/rsc";
import { createClient, localeToGraphLocale } from "@remkoj/optimizely-graph-client";
import Image from 'next/image'
import CmsLink, { createListKey } from "@shared/cms_link";
import LanguageSwitcher from "@shared/language_switcher";

export type SiteFooterProps = {
    locale?: string;
    ctx: GenericContext
}

export async function SiteFooter({locale, ctx }: SiteFooterProps)
{
    const { locale: contextLocale, client } = ctx
    const graphClient = client ?? createClient(undefined, undefined, {
        nextJsFetchDirectives: true,
        cache: true,
        queryCache: true
    })
    const footerLocale = locale ?? contextLocale
    const disableLayoutQueries = process.env.DISABLE_LAYOUT_QUERIES === '1'
    const footerData = disableLayoutQueries ? undefined : (await getSdk(graphClient).getFooterData({
        locale: footerLocale ? localeToGraphLocale(footerLocale) as Locales : Locales.ALL
    }).catch((e: any) => {
        const code = e?.response?.code ?? e?.code ?? 'UNKNOWN'
        const status = e?.response?.status ?? e?.status
        const message = e?.response?.system?.message ?? e?.message ?? 'Unknown error'
        const auth = e?.response?.system?.auth ?? ''
        console.error(`❌ [Optimizely Graph] [Error] ${code}${status ? ` (${status})` : ''} ${message} ${auth}`)
        return undefined
    }))?.appLayout?.items?.at(0)

    return <footer className="bg-vulcan dark:bg-vulcan-85 text-white py-8 lg:py-16 outer-padding">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-6 xl:gap-8 w-full">
                <section className="">
                    <div className="pb-1 uppercase font-bold">{ footerData?.contactInfoHeading ?? '' }</div>
                    <RichText className="prose prose-a:text-white prose-a:hover:text-azure" text={ footerData?.contactInfo?.json } ctx={ ctx } />
                </section>
                <CmsContentArea items={ footerData?.footerMenus } variant="footer" noWrapper itemWrapper={{
                    as: "nav",
                    className: ""
                }} ctx={ ctx }/>
                <LanguageSwitcher ctx={ ctx } />
            </div>
            <div className="mx-auto w-fit py-6 xl:py-12">
                <Image src={"/assets/moseybank-logo-white.svg"} width={200} height={35} alt="Moseybank Logo" unoptimized />
            </div>
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-6 text-sm items-center justify-center">
                <p>{ footerData?.copyright ?? '&copy; Optimizely. All rights reserved'}</p>
                <ul className="flex flex-row gap-6">
                    {footerData?.legalLinks?.map(linkItem => linkItem && (
                        <li key={createListKey(linkItem)}><CmsLink href={ linkItem } /></li>
                    ))}
                </ul>
            </div>
        </div>
    </footer>
}

export default SiteFooter
