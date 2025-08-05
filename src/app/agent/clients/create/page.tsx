import Link from 'next/link';
import { addClient } from '../actions';

export default function CreateClientPage() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/agent/clients" className="text-sm flex items-center gap-2 hover:underline">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="15 18 9 12 15 6" /></svg>
            Назад к списку клиентов
        </Link>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Добавить нового клиента</h1>
        <form action={addClient} className="space-y-6">
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium">Название компании *</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
              required 
              placeholder="ООО Ромашка"
            />
          </div>
          <div>
            <label htmlFor="tin" className="block mb-2 text-sm font-medium">ИНН</label>
            <input 
              type="text" 
              id="tin" 
              name="tin" 
              className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
              placeholder="1234567890"
            />
          </div>
          <div>
            <label htmlFor="kpp" className="block mb-2 text-sm font-medium">КПП</label>
            <input 
              type="text" 
              id="kpp" 
              name="kpp" 
              className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
              placeholder="123456789"
            />
          </div>
          <div>
            <label htmlFor="delivery_address" className="block mb-2 text-sm font-medium">Адрес доставки</label>
            <input 
              type="text" 
              id="delivery_address" 
              name="delivery_address" 
              className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
              placeholder="г. Москва, ул. Примерная, д. 1"
            />
          </div>
          <div>
            <label htmlFor="payment_terms" className="block mb-2 text-sm font-medium">Условия оплаты</label>
            <input 
              type="text" 
              id="payment_terms" 
              name="payment_terms" 
              className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
              placeholder="По факту / Отсрочка 7 дней"
            />
          </div>
          <div>
            <label htmlFor="contacts.phone" className="block mb-2 text-sm font-medium">Телефон</label>
            <input 
              type="tel" 
              id="contacts.phone" 
              name="contacts.phone" 
              className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
              placeholder="+7 999 123-45-67"
            />
          </div>
          <div>
            <label htmlFor="contacts.email" className="block mb-2 text-sm font-medium">Email</label>
            <input 
              type="email" 
              id="contacts.email" 
              name="contacts.email" 
              className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
              placeholder="client@example.com"
            />
          </div>
          <div>
            <label htmlFor="comments" className="block mb-2 text-sm font-medium">Комментарии</label>
            <textarea
              id="comments"
              name="comments"
              className="w-full p-2.5 rounded bg-gray-700 border border-gray-600 placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Дополнительная информация о клиенте"
              rows={2}
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Сохранить клиента
          </button>
        </form>
      </div>
    </div>
  );
}
