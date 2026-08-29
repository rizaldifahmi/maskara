import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export const Select = SelectPrimitive.Root
export function SelectTrigger({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>) {
  return <SelectPrimitive.Trigger className={cn('shadcn-select-trigger', className)} {...props}>{children}<SelectPrimitive.Icon><ChevronDown size={15}/></SelectPrimitive.Icon></SelectPrimitive.Trigger>
}
export const SelectValue = SelectPrimitive.Value
export function SelectContent({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>) {
  return <SelectPrimitive.Portal><SelectPrimitive.Content className={cn('shadcn-select-content', className)} position="popper" sideOffset={5} {...props}><SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport></SelectPrimitive.Content></SelectPrimitive.Portal>
}
export function SelectItem({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>) {
  return <SelectPrimitive.Item className={cn('shadcn-select-item', className)} {...props}><span className="select-check"><SelectPrimitive.ItemIndicator><Check size={14}/></SelectPrimitive.ItemIndicator></span><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText></SelectPrimitive.Item>
}
