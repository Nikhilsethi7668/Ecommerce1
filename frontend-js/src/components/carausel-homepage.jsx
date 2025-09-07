import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"

const slides = [
  "https://images.pexels.com/photos/5872360/pexels-photo-5872360.jpeg?auto=compress&cs=tinysrgb&w=900&h=1000&dpr=1",
  "https://images.pexels.com/photos/5872350/pexels-photo-5872350.jpeg?auto=compress&cs=tinysrgb&w=900&h=1000&dpr=1",
  "https://images.pexels.com/photos/3812433/pexels-photo-3812433.jpeg?auto=compress&cs=tinysrgb&w=900&h=1000&dpr=1",
  "https://images.pexels.com/photos/972887/pexels-photo-972887.jpeg?auto=compress&cs=tinysrgb&w=900&h=1000&dpr=1",  
  "https://images.pexels.com/photos/19281836/pexels-photo-19281836.jpeg?auto=compress&cs=tinysrgb&w=900&h=1000&dpr=1", // smartphones display
  "https://images.pexels.com/photos/7690080/pexels-photo-7690080.jpeg?auto=compress&cs=tinysrgb&w=900&h=1000&dpr=1",  // laptop + headphones
];

export default function ProductCarousel() {
  const autoplay = React.useRef(
    Autoplay({ delay: 2500, stopOnInteraction: false })
  )

  return (
    <Carousel
      plugins={[autoplay.current]}
      className="max-w-5xl mx-auto"
      opts={{
        loop: true,
        align: "start",
      }}
    >
      <CarouselContent>
        {slides.map((src, i) => (
          <CarouselItem
            key={i}
            className="basis md:basis lg:basis h-[50vh]"
          >
            <Card className="hover:shadow-md transition h-full cursor-pointer p-2">
              <CardContent className="p-0">
                {/* maintain 9:10 aspect */}
                <div className="h-[90%] w-full overflow-hidden rounded-md">
                  <img
                    src={src}
                    alt={`Product ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-2 text-sm font-medium text-center">
                  Product {i + 1}
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
