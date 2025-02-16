import Head from "next/head";

import { Result } from "@/components_v2/result";

const VerifiedSubscriber = () => {
  return (
    <>
      <Head>
        <title>Email Verified</title>
      </Head>
      <Result
        status="success"
        title="Email Verified"
        subTitle="Your email has been successfully verified. You have been subscribed to the blog."
      />
    </>
  );
};
VerifiedSubscriber.isMessage = true;
export default VerifiedSubscriber;
