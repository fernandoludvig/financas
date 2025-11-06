import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Bill {
  description: string
  amount: number
  dueDate: Date
  type: 'INCOME' | 'EXPENSE'
  status: string
}

export async function generateMonthlyReport(
  year: number,
  month: number,
  bills: Bill[],
  userName: string
) {
  const doc = new jsPDF()
  
  doc.setFontSize(20)
  doc.text('Relatório Financeiro Mensal', 14, 22)
  
  doc.setFontSize(12)
  doc.text(`Período: ${month}/${year}`, 14, 32)
  doc.text(`Usuário: ${userName}`, 14, 38)
  
  const income = bills
    .filter(b => b.type === 'INCOME' && b.status === 'PAID')
    .reduce((sum, b) => sum + b.amount, 0)
    
  const expenses = bills
    .filter(b => b.type === 'EXPENSE' && b.status === 'PAID')
    .reduce((sum, b) => sum + b.amount, 0)
    
  const balance = income - expenses
  
  doc.setFontSize(14)
  doc.text('Resumo:', 14, 50)
  doc.setFontSize(11)
  doc.text(`Receitas: R$ ${income.toFixed(2)}`, 14, 58)
  doc.text(`Despesas: R$ ${expenses.toFixed(2)}`, 14, 64)
  doc.text(`Saldo: R$ ${balance.toFixed(2)}`, 14, 70)
  
  const tableData = bills.map(bill => [
    format(bill.dueDate, 'dd/MM/yyyy', { locale: ptBR }),
    bill.description,
    bill.type === 'INCOME' ? 'Receita' : 'Despesa',
    `R$ ${bill.amount.toFixed(2)}`,
    bill.status
  ])
  
  autoTable(doc, {
    startY: 80,
    head: [['Vencimento', 'Descrição', 'Tipo', 'Valor', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [52, 152, 219] }
  })
  
  return doc.output('arraybuffer')
}

