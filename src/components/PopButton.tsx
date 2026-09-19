import type { ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import type { LinkProps } from "react-router-dom";

import { popButtonClass } from "@/components/pop";
import type { PopSize, PopTone } from "@/components/pop";

interface PopStyleProps {
  tone?: PopTone;
  size?: PopSize;
}

export function PopLink({
  tone,
  size,
  className,
  ...props
}: PopStyleProps & LinkProps & { className?: string }) {
  return <Link className={popButtonClass(tone, size, className)} {...props} />;
}

export function PopButton({
  tone,
  size,
  className,
  type = "button",
  ...props
}: PopStyleProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={popButtonClass(tone, size, className)} {...props} />;
}
