"use client"

export function OrdersPage() {
  return (
    <div className="min-h-[70vh] grid place-items-center px-6">
      <div className="w-full max-w-2xl">
        <div className="relative rounded-2xl border border-border bg-card/70 backdrop-blur p-10 shadow-sm">
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/25">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-8 w-8 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2v4" />
              <path d="M18 2v4" />
              <path d="M3 9h18" />
              <path d="M7 9v11a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9" />
            </svg>
          </div>

          <h1 className="text-center font-heading text-3xl sm:text-4xl font-bold tracking-tight">
            All orders will be shown here
          </h1>
          <p className="mt-2 text-center text-sm sm:text-base text-muted-foreground">
            When you place an order, it will appear on this page with its status and details.
          </p>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-6 -bottom-6 h-24 bg-gradient-to-t from-primary/10 to-transparent blur-2xl"
          />
        </div>
      </div>
    </div>
  )
}
