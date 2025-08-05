'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProductAction } from '@/app/products/create/actions'
import { toast } from 'sonner'
import { PlusCircle } from 'lucide-react'

// Определяем тип для нового товара, чтобы передавать его обратно
export type NewProduct = {
  id: string;
  title: string;
  nomenclature_code: string;
  [key: string]: any; // Для остальных полей
}

interface CreateProductDialogProps {
  onProductCreated: (newProduct: NewProduct) => void
}

export function CreateProductDialog({ onProductCreated }: CreateProductDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productData, setProductData] = useState({
    title: '',
    nomenclature_code: '',
    purchase_price: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setProductData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    toast.loading('Создание нового товара...')

    const result = await createProductAction({
      title: productData.title,
      nomenclature_code: productData.nomenclature_code,
      purchase_price: productData.purchase_price ? parseFloat(productData.purchase_price) : undefined,

    })

    toast.dismiss()

    if (result.success && result.product) {
      toast.success('Новый товар успешно создан!')
      onProductCreated(result.product as NewProduct)
      setIsOpen(false)
      // Сброс формы
      setProductData({
        title: '',
        nomenclature_code: '',
        purchase_price: '',

      })
    } else {
      toast.error(result.error || 'Произошла ошибка при создании товара.')
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Новый товар</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Создать новый товар</DialogTitle>
          <DialogDescription>
            Заполните информацию о новом товаре. Название и артикул обязательны.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Название
              </Label>
              <Input
                id="title"
                value={productData.title}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nomenclature_code" className="text-right">
                Артикул
              </Label>
              <Input
                id="nomenclature_code"
                value={productData.nomenclature_code}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purchase_price" className="text-right">
                Цена закупки
              </Label>
              <Input
                id="purchase_price"
                value={productData.purchase_price}
                onChange={handleInputChange}
                type="number"
                className="col-span-3"
              />
            </div>

          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Создание...' : 'Создать товар'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
