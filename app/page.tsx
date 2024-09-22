"use client";
import Planet from "./assets/vecteezy_maps-guidance-3d-travel-and-holiday-illustration_28241866.png";
import Image from "next/image";
import { Button } from "@nextui-org/button";
import { Card, CardBody } from "@nextui-org/react";
import { Bricolage_Grotesque } from "next/font/google";
import { FaSave, FaShareAltSquare, FaFileArchive } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

const BgFont = Bricolage_Grotesque({
  weight: "800",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

export default function Index() {
  const handleClick = () => {
    // Lógica para manejar clicks
  };

  useEffect(() => {
    AOS.init({
      once: true,
    });
  }, []);

  return (
    <>
      <div className="absolute top-0 z-[-2] w-full h-dvh bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>

      <div className="mx-auto flex flex-col items-center justify-center w-full max-w-5xl">
        <Image
          src={Planet}
          width={200}
          height={200}
          alt="Planet"
          className="mt-10"
          data-aos="fade-up"
          data-aos-delay="100"
        />
        <h1
          className={`gradient-text_anim landing-title ${BgFont.className}`}
          data-aos="fade-up"
          data-aos-delay="200"
        >
          Save your places and share <br />
          them with your friends
        </h1>
        <p
          className="text-center text-neutral-500 text-lg w-2/3 mx-auto mt-10"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          Save, share, preview your places using a friendly and simple platform. You can export,
          import and share your places with your friends.
        </p>
        <div
          className="flex items-center justify-center mt-5 gap-3"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <Button color="primary" onClick={handleClick} variant="shadow" size="lg">
            Get Started
          </Button>
          <Button onClick={handleClick} size="lg">
            About this project
          </Button>
        </div>
        <div className="flex items-stretch justify-between mt-20 gap-5">
          <Card
            className="h-auto px-3 py-5"
            data-aos="fade-up"
            data-aos-delay="400"
            data-aos-duration="1000"
          >
            <CardBody>
              <FaSave size={40} />
              <p className="mt-5">
                Easily save and organize your favorite places. Access them anytime from a
                user-friendly platform.
              </p>
            </CardBody>
          </Card>

          <Card
            className="h-auto px-3 py-5"
            data-aos="fade-up"
            data-aos-delay="600"
            data-aos-duration="1000"
          >
            <CardBody>
              <FaShareAltSquare size={40} />
              <p className="mt-5">
                Share your saved locations with friends in just one click. Discover new places
                through your connections.
              </p>
            </CardBody>
          </Card>

          <Card
            className="h-auto px-3 py-5"
            data-aos="fade-up"
            data-aos-delay="800"
            data-aos-duration="1000"
          >
            <CardBody>
              <FaFileArchive size={40} />
              <p className="mt-5">
                Export your list of places or import locations from other devices. Keep your
                favorite spots always accessible and synced.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
