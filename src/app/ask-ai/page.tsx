import type { Metadata } from 'next';
import { AskAiForm } from './AskAiForm';

export const metadata: Metadata = {
  title: 'Ask about the Brazilian states',
  description: 'Ask an AI assistant about Brazilian states using live data.',
};

export default function AskAiPage() {
  return <AskAiForm />;
}
