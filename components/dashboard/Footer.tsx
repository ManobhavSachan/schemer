import { ModeToggle } from "@/components/ui/mode-toggle";
import { Footer, FooterBottom } from "@/components/ui/footer";
import { Button } from "../ui/button";

export default function FooterSection() {
  return (
    <footer className="w-full bg-background px-4">
      <div className="mx-auto max-w-container">
        <Footer className="pt-0">
          <FooterBottom className="mt-0 flex flex-col items-center gap-4 sm:flex-col md:flex-row">
            <p className="text-primary text-sm">
              © The Dasher Company. How to reserve rights?
            </p>
            <div className="flex sm:flex-row flex-col items-center sm:gap-4 gap-0">
              <Button variant="link" asChild>
                <a href="#">Contact Us</a>
              </Button>
              <Button variant="link" asChild>
                <a href="#">Privacy Policy</a>
              </Button>
              <Button variant="link" asChild>
                <a href="#">Terms of Service</a>
              </Button>
              <ModeToggle />
            </div>
          </FooterBottom>
        </Footer>
      </div>
    </footer>
  );
}
