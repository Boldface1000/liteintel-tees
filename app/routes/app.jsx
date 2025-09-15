import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useTransition } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  TextField,
  Select,
  Checkbox,
  Stack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server.js";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return json({});
};

export const action = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");
  // Process the form data here
  return redirect("/app");
};

export default function Index() {
  const {} = useLoaderData();
  const transition = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const isLoading = transition.state === "submitting";

  return (
    <Page>
      <ui-title-bar title="Contact Form">
        <button variant="primary" type="submit" form="contact-form">
          Save
        </button>
      </ui-title-bar>
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="h2" variant="headingMd">
              Contact Form
            </Text>
            <br />
            <Form method="post" id="contact-form">
              <Stack vertical>
                <TextField
                  label="Name"
                  value={name}
                  onChange={setName}
                  name="name"
                  type="text"
                  autoComplete="name"
                />
                <TextField
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  name="email"
                  type="email"
                  autoComplete="email"
                />
                <TextField
                  label="Message"
                  value={message}
                  onChange={setMessage}
                  name="message"
                  type="text"
                  multiline={4}
                  autoComplete="off"
                />
                <Button submit primary loading={isLoading}>
                  Submit
                </Button>
              </Stack>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
