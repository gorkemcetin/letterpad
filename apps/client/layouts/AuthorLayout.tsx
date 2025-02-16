import { ReactNode } from 'react';
import { AuthorFrontMatter } from 'types/AuthorFrontMatter';

import PageTitle from '@/components/PageTitle';
import SectionContainer from '@/components/SectionContainer';
import { PageSEO } from '@/components/SEO';
import SocialIcon from '@/components/social-icons';

interface Props {
  children: ReactNode;
  data: AuthorFrontMatter;
  site_title: string;
  site_url: string;
}

export default function AuthorLayout({
  children,
  data,
  site_title,
  site_url,
}: Props) {
  const {
    name,
    avatar,
    occupation,
    company,
    email,
    twitter,
    linkedin,
    github,
    banner,
  } = data;

  return (
    <SectionContainer>
      <PageSEO
        title={`About - ${name}`}
        description={`About me - ${name}`}
        site_banner={banner}
        site_title={site_title}
        url={site_url}
        twSite={twitter}
      />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <PageTitle>About</PageTitle>
        </div>
        <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
          <div className="flex flex-col items-center space-x-2 pt-8">
            {avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt="avatar"
                width="192px"
                height="auto"
                className="h-48 w-48 rounded-full object-cover"
              />
            )}
            <h3 className="pt-4 pb-2 text-2xl font-bold leading-8 tracking-tight">
              {name}
            </h3>
            <div className="text-gray-500 dark:text-gray-300">{occupation}</div>
            <div className="text-gray-500 dark:text-gray-300">{company}</div>
            <div className="flex space-x-3 pt-6">
              <SocialIcon kind="mail" href={`mailto:${email}`} />
              <SocialIcon kind="github" href={github} />
              <SocialIcon kind="linkedin" href={linkedin} />
              <SocialIcon kind="twitter" href={twitter} />
            </div>
          </div>
          <div className="prose max-w-none pt-8 pb-8 dark:prose-dark xl:col-span-2">
            {children}
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
