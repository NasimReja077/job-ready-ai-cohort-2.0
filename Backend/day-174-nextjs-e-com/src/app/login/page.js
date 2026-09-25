"use client";

import Link from "next/link";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

const Page = () => {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const user = {
      email: formData.email || "demo@example.com",
      name: formData.email ? formData.email.split("@")[0] : "Demo User",
    };

    login(user);
    router.push("/layout/home");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md rounded-2xl border shadow-xl">
        <CardContent className="p-8">
          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Login to continue to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label>Email</Label>

              <Input
                name="email"
                onChange={handleChange}
                type="email"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>Password</Label>

              <Input
                name={"password"}
                onChange={handleChange}
                type="password"
                placeholder="Enter your password"
              />
            </div>

            {/* Button */}
            <Button className="w-full rounded-xl">Login</Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;