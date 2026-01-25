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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { FormState } from "@/lib/utils";

export default function FormUI() {
  const [formData, setFormData] = useState({
    username: "",
    eventCode: "",
  });

  const [formState, setFormState] = useState<FormState>({
    isSuccess: false,
    isSubmit: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormState({
      isSuccess: false,
      isSubmit: null,
    });

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

      setFormState({
        isSuccess: data.success,
        isSubmit: true,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(name, value);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange =
    (name: keyof typeof formData) => (value: string) => {
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
        {formData.username.length > 0 && formState.isSubmit ? (
          <Alert
            className={`mb-4 ${
              formState.isSuccess
                ? "border-teal-500 text-teal-900"
                : "border-red-400 bg-red-50"
            }`}
          >
            <AlertTitle>
              {formState.isSuccess
                ? `Success: ${formData.username} ✅`
                : `Failed: ${formData.username} ❌`}
            </AlertTitle>
          </Alert>
        ) : (
          ""
        )}

        <Select name="username" onValueChange={handleSelectChange("username")}>
          <SelectTrigger className=" ">
            <SelectValue placeholder="Username" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lovekosiax">lovekosiax</SelectItem>
            <SelectItem value="lovekosiax1">lovekosiax1</SelectItem>
            <SelectItem value="ezpz1x">ezpz1x</SelectItem>
            <SelectItem value="ezpz2x">ezpz2x</SelectItem>
            <SelectItem value="ezpz4x">ezpz4x</SelectItem>
          </SelectContent>
        </Select>
        <Label htmlFor="code">Code</Label>
        <Input
          id="eventCode"
          name="eventCode"
          required
          value={formData.eventCode}
          onChange={handleChange}
        />
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
