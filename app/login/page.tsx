import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4">
            {/* Placeholder for Logo */}
            <div className="w-20 h-20 mx-auto bg-gray-300 rounded-full flex items-center justify-center text-gray-500">
              Logo
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Log In</CardTitle>
          <CardDescription>Manage your agency's clients with ease.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required />
              {/* TODO: Add email validation error message */}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
              {/* TODO: Add password validation error message */}
            </div>
            <Button type="submit" className="w-full">Log In</Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Forgot Password?
          </a>
        </CardFooter>
      </Card>
    </div>
  );
} 