import { MessageSquareText, Zap, KeyRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <Card className="w-full shadow-lg">
          <CardHeader className="items-center text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
               <svg
                  className="h-8 w-8 text-accent"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 14h.01" />
                  <path d="M12.5 21.9A9 9 0 0 1 3.1 12.5a9 9 0 0 1 9.4-9.4 9.4 9.4 0 0 1 6.5 2.5" />
                  <path d="M18 10V4.5" />
                  <path d="M21 7.5h-6" />
                </svg>
            </div>
            <CardTitle className="text-3xl font-headline">Twilio Chat Agent</CardTitle>
            <CardDescription className="text-base sm:text-lg">
              A demonstration of integrating Twilio with Firebase for a WhatsApp chat agent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-4 sm:px-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Webhook Trigger"
                description="A public endpoint to receive incoming messages."
              />
              <FeatureCard
                icon={<KeyRound className="h-6 w-6" />}
                title="Secure Secrets"
                description="Twilio credentials managed via environment variables."
              />
              <FeatureCard
                icon={<MessageSquareText className="h-6 w-6" />}
                title="AI-Powered Replies"
                description="Uses Genkit to generate conversational responses."
              />
            </div>
            <div className="rounded-md border bg-muted/50 p-4 text-center">
              <h3 className="font-semibold">Test the Chatbot</h3>
              <p className="text-sm text-muted-foreground">
                To test the chatbot, you need to configure the webhook in your Twilio Sandbox settings to point to this application's API endpoint.
              </p>
            </div>
          </CardContent>
           <CardFooter className="flex-col gap-4 px-4 pt-6 sm:px-8">
            <Button asChild size="lg">
              <Link href="https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn" target="_blank">Configure Twilio Webhook</Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Click the button to go to your Twilio console.
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center space-y-2 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}