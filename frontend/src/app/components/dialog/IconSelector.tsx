import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import Image from "next/image";

const icons = [
  { id: 1, name: "batting" },
  { id: 2, name: "fielding" },
  { id: 3, name: "injury" },
  { id: 4, name: "pitching" },
  { id: 5, name: "running" },
  { id: 0, name: "default" },
];

const nameToUrl = (name: string) => {
  if (name === "default") {
    return name;
  }
  return `/widget-icons/${name}.jpg`;
};

type IconSelectorProps = {
  imgUrl: string;
  setImgUrl: (url: string) => void;
};

export default function IconSelector({ imgUrl, setImgUrl }: IconSelectorProps) {
  const handleSelect = (name: string) => {
    setImgUrl(nameToUrl(name));
  };

  return (
    <div className="grid grid-cols2 sm:grid-cols-4 gap-4">
      {icons.map((item) => (
        <Card
          key={item.id}
          className={`flex flex-col items-center justify-center p-0 cursor-pointer border ${imgUrl === nameToUrl(item.name) ? "border-primary" : "border-muted"}`}
          onClick={() => handleSelect(item.name)}
        >
          {item.id === 0 ? (
            <div className="text-sm">{"None"}</div>
          ) : (
            <div className="w-full h-auto overflow-hidden rounded-xl">
              <Image
                src={nameToUrl(item.name)}
                width={100}
                height={100}
                alt={item.name}
                className="object-cover transition duration-200 hover:grayscale"
              />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
