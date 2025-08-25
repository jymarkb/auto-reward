"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Axe, Bot } from "lucide-react";

export default function FormUI() {
  return (
    <Card className="max-w-md w-full p-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot />
          {/* <span className="text-primary">Auo Reward Bot</span> */}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Label htmlFor="username">Username</Label>
        <Input id="username" name="username" required />
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" name="password" />
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full flex items-center shadow-md">
          Get Reward
          <Axe />
        </Button>
      </CardFooter>
    </Card>
  );
}
