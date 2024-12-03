import { Text, ScrollView, View } from 'tamagui';

export default function EulaTerms() {
  return (
    <ScrollView
      padding="$3"
      flex={1}
      backgroundColor="$primary_blue"
      contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
      <Text
        fontSize="$10"
        color="$white"
        fontFamily="$heading"
        fontWeight="600"
        textAlign="center"
        mt="$8">
        Eula Terms
      </Text>
      <View bg={'$white'} py="$6" px={'$4'} borderRadius={'$5'} mt="$8">
        <Text fontSize="$6" fontWeight="bold" marginBottom="$2">
          End User License Agreement (EULA)
        </Text>
        <Text marginBottom="$2">
          This End User License Agreement ("Agreement") is a legal agreement between you ("User")
          and NewGen Leaders ("Company") governing your use of the Empowering Educators mobile
          application ("App"). By downloading, installing, or using the App, you agree to be bound
          by the terms of this Agreement.
        </Text>
        <Text fontWeight="bold" marginBottom="$1">
          1. License Grant
        </Text>
        <Text marginBottom="$2">
          NewGen Leaders grants you a limited, non-exclusive, non-transferable, revocable license to
          use the Empowering Educators app for personal, non-commercial purposes strictly in
          accordance with the terms of this Agreement.
        </Text>
        <Text fontWeight="bold" marginBottom="$1">
          2. Restrictions
        </Text>
        <Text marginBottom="$2">
          You agree not to:
          {'\n'}- Decompile, reverse engineer, or disassemble the App.
          {'\n'}- Use the App for any unlawful purpose or to violate any laws.
          {'\n'}- Modify, adapt, or create derivative works of the App.
          {'\n'}- Rent, lease, sell, or sublicense the App to any third party.
        </Text>
        <Text fontWeight="bold" marginBottom="$1">
          3. Intellectual Property
        </Text>
        <Text marginBottom="$2">
          All intellectual property rights in the Empowering Educators app, including but not
          limited to content, trademarks, and software, are owned by NewGen Leaders or its
          licensors. This Agreement does not grant you any ownership rights to the App.
        </Text>
        <Text fontWeight="bold" marginBottom="$1">
          4. Privacy and Data Collection
        </Text>
        <Text marginBottom="$2">
          Your use of the App is subject to NewGen Leaders’ Privacy Policy, which explains how your
          data is collected, used, and shared. By using the App, you consent to the collection and
          use of your data as described in the Privacy Policy.
        </Text>
        <Text fontWeight="bold" marginBottom="$1">
          5. Updates
        </Text>
        <Text marginBottom="$2">
          NewGen Leaders may provide updates, upgrades, or bug fixes to improve the App. These
          updates may be automatically installed without prior notice. You agree to receive such
          updates as part of your continued use of the App.
        </Text>
        <Text fontWeight="bold" marginBottom="$1">
          6. Termination
        </Text>
        <Text marginBottom="$2">
          This Agreement is effective until terminated. NewGen Leaders may terminate this Agreement
          at any time if you fail to comply with its terms. Upon termination, you must cease using
          the App and delete it from your devices.
        </Text>
        <Text fontWeight="bold" marginBottom="$1">
          7. Disclaimer of Warranties
        </Text>
        <Text marginBottom="$2">
          The App is provided "as is" without warranties of any kind, either express or implied,
          including but not limited to warranties of merchantability or fitness for a particular
          purpose.
        </Text>
        <Text fontWeight="bold" marginBottom="$1">
          8. Limitation of Liability
        </Text>
        <Text marginBottom="$2">
          To the fullest extent permitted by law, NewGen Leaders shall not be liable for any
          indirect, incidental, special, or consequential damages arising out of or related to your
          use of the App.
        </Text>
        <Text fontWeight="bold" marginBottom="$1">
          9. Governing Law
        </Text>
        <Text marginBottom="$2">
          This Agreement shall be governed by and construed in accordance with the laws of
          Australia, without regard to its conflict of laws principles.
        </Text>
        <Text fontWeight="bold" marginBottom="$1">
          10. Dispute Resolution
        </Text>
        <Text marginBottom="$2">
          Any disputes arising out of or related to this Agreement shall be resolved through binding
          arbitration in accordance with the rules of ACICA or through a court of competent
          jurisdiction in Australia.
        </Text>
        <Text fontWeight="bold" marginBottom="$1">
          11. Changes to this Agreement
        </Text>
        <Text marginBottom="$2">
          NewGen Leaders reserves the right to modify this Agreement at any time. Your continued use
          of the App following such modifications constitutes your acceptance of the new terms.
        </Text>
        <Text fontWeight="bold" marginBottom="$1">
          12. Contact Information
        </Text>
        <Text marginBottom="$2">
          For questions or concerns regarding this Agreement, please contact us at:
          {'\n'}Email: <Text fontWeight={'bold'}>joel@newgenleaders.com.au</Text>
          {'\n'}Address: <Text fontWeight={'bold'}>53B Gilbertson Road, Western Australia</Text>
        </Text>
        <Text marginBottom="$2" fontWeight={'bold'}>
          By using the App, you acknowledge that you have read, understood, and agree to be bound by
          this End User License Agreement.
        </Text>
      </View>
    </ScrollView>
  );
}
