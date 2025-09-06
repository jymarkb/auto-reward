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
import { Axe, Bot } from "lucide-react";
import React, { useState } from "react";

export default function FormUI() {
  const [formData, setFormData] = useState({
    username: "",
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/loginAndAuthorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      console.log("Login success:", data);

    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Card className="max-w-md w-full p-8">
      <CardHeader className=" pb-2">
        <CardTitle className="flex items-center gap-2">
          <Bot />
          <span className="text-primary text-xl">Auto Reward</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          required
          value={formData.username}
          onChange={handleChange}
        />
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" name="password" />
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          className="w-full flex items-center shadow-md"
          onClick={handleSubmit}
        >
          Get Reward
          <Axe />
        </Button>
      </CardFooter>
    </Card>
  );
}
