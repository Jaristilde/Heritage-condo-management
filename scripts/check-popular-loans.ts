import { db } from '../server/db';
import { popularLoans } from '../shared/schema';

async function checkLoans() {
  try {
    const loans = await db.select().from(popularLoans);
    console.log('Total Popular Loans in database:', loans.length);
    console.log('\nLoans data:');
    loans.forEach(loan => {
      console.log(`  Unit ${loan.unit}: ${loan.status} - $${loan.currentBalance} (Loan: ${loan.loanNumber || 'N/A'})`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkLoans();
