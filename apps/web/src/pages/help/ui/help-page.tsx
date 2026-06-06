"use client";

// TODO: Wire these link cards to your real documentation, community and
// support URLs. Replace the FAQ entries with real content or fetch them
// from your CMS.

import type { MessageDescriptor } from "@lingui/core";
import type { ComponentType } from "react";

import { BookOpen, ExternalLink, LifeBuoy, MessageCircle } from "lucide-react";
import { Accordion, Card, Link } from "@heroui/react";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";

type HelpLink = {
  description: MessageDescriptor;
  href: string;
  icon: ComponentType<{ className?: string }>;
  title: MessageDescriptor;
};

const HELP_LINKS: readonly HelpLink[] = [
  {
    description: msg`Read the docs, guides, and API reference to get up and running.`,
    href: "#",
    icon: BookOpen,
    title: msg`Documentation`,
  },
  {
    description: msg`Join the community to ask questions, share tips, and connect with other users.`,
    href: "#",
    icon: MessageCircle,
    title: msg`Community`,
  },
  {
    description: msg`Get help from our support team. We reply within one business day.`,
    href: "#",
    icon: LifeBuoy,
    title: msg`Contact support`,
  },
];

type FaqItem = {
  question: MessageDescriptor;
  answer: MessageDescriptor;
};

const FAQS: readonly FaqItem[] = [
  {
    answer: msg`Open Settings > Billing and click 'Change plan'. Changes take effect at the start of your next billing cycle.`,
    question: msg`How do I upgrade my plan?`,
  },
  {
    answer: msg`Yes. In Settings > Security turn on Two-factor authentication and follow the on-screen prompts.`,
    question: msg`Can I enable two-factor authentication?`,
  },
  {
    answer: msg`Head to Settings > General and click 'Delete account'. This action is irreversible and purges all your data after 30 days.`,
    question: msg`How do I delete my account?`,
  },
  {
    answer: msg`You can invite new members from Settings > Team. They'll receive an email invite with instructions to join.`,
    question: msg`How do I invite teammates?`,
  },
];

export function HelpPage() {
  const { t } = useLingui();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 pb-10 pt-4">
      <p className="text-muted text-sm">
        <Trans>Find answers, contact support, or dig into the docs.</Trans>
      </p>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {HELP_LINKS.map((link) => (
          <HelpLinkCard key={link.href} link={link} />
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-foreground text-base font-semibold">
          <Trans>Frequently asked questions</Trans>
        </h2>
        <Accordion className="w-full">
          {FAQS.map((faq, index) => (
            <Accordion.Item key={index} id={`faq-${index}`}>
              <Accordion.Heading>
                <Accordion.Trigger>
                  {t(faq.question)}
                  <Accordion.Indicator />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body className="text-muted text-sm">{t(faq.answer)}</Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </section>

      <footer className="text-muted text-xs">
        <Trans>
          Still stuck?{" "}
          <Link className="no-underline" href="mailto:support@example.com">
            support@example.com
          </Link>
        </Trans>
      </footer>
    </div>
  );
}

function HelpLinkCard({ link }: { link: HelpLink }) {
  const { t } = useLingui();
  const Icon = link.icon;

  return (
    <Card className="rounded-2xl">
      <Card.Header>
        <div className="bg-accent-soft text-accent flex size-10 items-center justify-center rounded-xl">
          <Icon className="size-5" />
        </div>
        <Card.Title className="text-base">{t(link.title)}</Card.Title>
        <Card.Description>{t(link.description)}</Card.Description>
      </Card.Header>
      <Card.Footer>
        <Link className="text-accent inline-flex items-center gap-1 text-sm" href={link.href}>
          <Trans comment="Link that opens the help resource">Open</Trans>
          <ExternalLink className="size-3.5" />
        </Link>
      </Card.Footer>
    </Card>
  );
}
