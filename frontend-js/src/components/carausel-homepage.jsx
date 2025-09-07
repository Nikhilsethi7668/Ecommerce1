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

// some demo product images – swap with real
const slides = [
  "https://picsum.photos/360/400?1",
  "https://picsum.photos/360/400?2",
  "https://picsum.photos/360/400?3",
  "https://picsum.photos/360/400?4",
  "https://picsum.photos/360/400?5",
  "https://picsum.photos/360/400?6",
]

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

      {/* optional nav */}
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
