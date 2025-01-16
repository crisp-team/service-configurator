import React from "react"
import { Logo } from "./Logo"

export const PrintFooter = () => {
  return (
    <div className="print-footer flex justify-between items-end gap-6 flex-col sm:flex-row pt-32 md:pt-56">
      <div className="flex gap-6">
          <div className="">
              <p className="mb-1 font-regular text-custom-secondary-dark opacity-50">Email</p>
              <p className="heading-h6 text-custom-primary transition-opacity hover:opacity-70"><a href="mailto:salg@lastmile.no">salg@lastmile.no</a></p>
          </div>
          <div className="w-px bg-custom-secondary-dark/30">&#160;</div>
          <div className="">
              <p className="mb-1 font-regular text-custom-secondary-dark opacity-50">Telefon</p>
              <p className="heading-h6 text-custom-primary transition-opacity hover:opacity-70"><a href="tel:66907980">66907980</a></p>
          </div>
      </div>
      <Logo />
    </div>
  )
}
