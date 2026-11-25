import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';

export type OwnerNewOrderEmailProps = {
  customerName: string;
  customerEmail: string | null;
  delivery: 'pickup' | 'shipping';
  items: { name: string; size: string; quantity: number }[];
  total: string;
  ordersUrl: string;
};

// Sent to the founder, not the buyer: who bought what, and a way to the log.
export function OwnerNewOrderEmail({
  customerName,
  customerEmail,
  delivery,
  items,
  total,
  ordersUrl,
}: OwnerNewOrderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {customerName} just ordered ({total}).
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>NEW ORDER</Heading>
          <Text style={textStyle}>
            {customerName}
            {customerEmail ? ` (${customerEmail})` : ''}
          </Text>
          {items.map((item) => (
            <Text key={`${item.name}-${item.size}`} style={textStyle}>
              {item.quantity} × {item.name} ({item.size})
            </Text>
          ))}
          <Text style={textStyle}>
            {total} · {delivery === 'pickup' ? 'PICKUP' : 'SHIP'}
          </Text>
          <Link href={ordersUrl} style={linkStyle}>
            OPEN STORK
          </Link>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: '#f4eddd',
  color: '#16110d',
  fontFamily: 'Arial, Helvetica, sans-serif',
  margin: 0,
  padding: '32px 16px',
};

const containerStyle = {
  border: '2px solid #e0361f',
  maxWidth: '480px',
  padding: '32px',
};

const headingStyle = {
  color: '#e0361f',
  fontSize: '28px',
  fontWeight: 700 as const,
  margin: '0 0 16px',
};

const textStyle = {
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 8px',
};

const linkStyle = {
  color: '#e0361f',
  fontSize: '14px',
  fontWeight: 700 as const,
};
