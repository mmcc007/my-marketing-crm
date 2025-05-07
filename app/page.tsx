import { redirect } from 'next/navigation';
 
export default function HomePage() {
  redirect('/login');
  // This return is technically unreachable but satisfies React's requirement for a component to return JSX.
  return null;
} 