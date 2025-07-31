import { Main } from '@strapi/design-system';
import { useIntl } from 'react-intl';
import React, { useState } from 'react';
import { useFetchClient } from '@strapi/admin/strapi-admin';
import {
  Box,
  TextInput,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
} from '@strapi/design-system';

import { getTranslation } from '../utils/getTranslation';

const HomePage = () => {
  const { formatMessage } = useIntl();

   const { get } = useFetchClient();

  const [company, setCompany] = useState('');
  const [type, setType] = useState('');
  const [data, setData] = useState([]);

  const fetchFilteredExperts = async () => {
    let url = '/content-manager/collection-types/api::expert.expert?populate[experiences][populate][company]=true';

    const filters = [];
    if (company) filters.push(`filters[experiences][company][name][$containsi]=${company}`);
    if (type) filters.push(`filters[experiences][type][$eq]=${type}`);

    if (filters.length) url += `&${filters.join('&')}`;

      const res = await get(url);
    console.log("✅ RESPONSE:", res);

    // ✅ For Content Manager API
    setData(res?.data?.results || []);
  };

  return (
    <Main>
      <h1>Welcome to {formatMessage({ id: getTranslation('plugin.name') })}</h1>

      <Box padding={6} background="neutral100">
      <TextInput
        label="Company Name"
        placeholder="Enter company name"
        onChange={(e) => setCompany(e.target.value)}
        value={company}
        name="company"
      />
      <TextInput
        label="Experience Type"
        placeholder="Enter experience type"
        onChange={(e) => setType(e.target.value)}
        value={type}
        name="type"
        style={{ marginTop: '1rem' }}
      />
      <Button onClick={fetchFilteredExperts} style={{ marginTop: '1rem' }}>
        Search
      </Button>

      {data.length > 0 && (
        <Table colCount={3} rowCount={data.length} style={{ marginTop: '2rem' }}>
          <Thead>
            <Tr>
              <Th>Expert Name</Th>
              <Th>Company</Th>
              <Th>Experience Type</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((expert) => (
          <Tr key={expert.id}>
            <Td>{expert.name || 'N/A'}</Td>
            <Td>
              {expert.experiences?.map((exp, i) => (
                <div key={i}>{exp.company?.name || 'N/A'}</div>
              ))}
            </Td>
            <Td>
              {expert.experiences?.map((exp, i) => (
                <div key={i}>{exp.type || 'N/A'}</div>
              ))}
            </Td>
          </Tr>
        ))}
          </Tbody>
        </Table>
      )}
    </Box>
    </Main>
  );
};

export { HomePage };
