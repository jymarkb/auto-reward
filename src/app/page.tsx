"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginAndAuthorize } from "./actions/Test";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Axe, Bot } from "lucide-react";
export default function Home() {
  const [progress, setProgress] = useState(13);
  const [actionTitle, setActionTitle] = useState("");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Card className="max-w-sm w-full p-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot />
            <span className="text-primary">Auo Reward Bot</span>
          </CardTitle>
        </CardHeader>
        <form action={loginAndAuthorize}>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Username</Label>
                <Input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="default"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="********"
                />
              </div>
            </div>

            {progress > 0 ? (
              <div className="">
                <Progress value={progress} className="mt-4" />
                <p className="mt-2 text-sm font-bold">Login</p>
              </div>
            ) : (
              ""
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full flex items-center shadow-md"
            >
              <span>Get Reward</span>
              <Axe />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
