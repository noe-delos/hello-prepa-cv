// app/components/header.tsx
import Image from "next/image";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="w-full border-b">
      <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="relative h-10 w-[80px]">
            <Image
              src="/hello-prepa-logo.png"
              alt="Hello Prépa"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-lg font-semibold">Analyseur de CV</span>
        </div>
        <nav className="ml-auto flex items-center gap-4">
          <Button variant="ghost">Nos préparations</Button>
          <Button variant="ghost">Nos professeurs</Button>
          <Button variant="ghost">Tarifs</Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            variant="default"
          >
            Prendre rendez-vous
          </Button>
        </nav>
      </div>
    </header>
  );
}
