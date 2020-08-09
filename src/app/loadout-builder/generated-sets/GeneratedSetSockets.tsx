import React, { useState } from 'react';
import { DimItem, DimSocket } from 'app/inventory/item-types';
import { LockedArmor2Mod } from '../types';
import { D2ManifestDefinitions } from 'app/destiny2/d2-definitions';
import GeneratedSetMod from './GeneratedSetMod';
import { PlugCategoryHashes } from 'data/d2/generated-enums';
import { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2';
import SocketDetails from '../../item-popup/SocketDetails';
import ReactDOM from 'react-dom';
import './GeneratedSetSockets.scss';

const undesireablePlugs = [
  PlugCategoryHashes.ArmorSkinsEmpty,
  PlugCategoryHashes.Shader,
  PlugCategoryHashes.V460PlugsArmorMasterworksStatResistance1,
  PlugCategoryHashes.V460PlugsArmorMasterworksStatResistance2,
  PlugCategoryHashes.V460PlugsArmorMasterworksStatResistance3,
  PlugCategoryHashes.V460PlugsArmorMasterworksStatResistance4,
];

interface SocketAndPlug {
  plug: DestinyInventoryItemDefinition;
  socket: DimSocket;
}

interface Props {
  item: DimItem;
  lockedMods: LockedArmor2Mod[];
  defs: D2ManifestDefinitions;
}

function GeneratedSetSockets({ item, lockedMods, defs }: Props) {
  const [socketInfo, setSocketInfo] = useState<SocketAndPlug | null>(null);
  if (!item.isDestiny2()) {
    return null;
  }

  const modsAndPerks: SocketAndPlug[] = [];
  const modsToUse = [...lockedMods];

  for (const socket of item.sockets?.sockets || []) {
    const socketType = defs.SocketType.get(socket.socketDefinition.socketTypeHash);
    let toSave: DestinyInventoryItemDefinition | undefined;

    for (let modIndex = 0; modIndex < modsToUse.length; modIndex++) {
      const mod = modsToUse[modIndex].mod;
      if (
        socketType.plugWhitelist.some((plug) => plug.categoryHash === mod.plug.plugCategoryHash)
      ) {
        toSave = mod;
        modsToUse.splice(modIndex, 1);
      }
    }

    if (!toSave) {
      toSave = defs.InventoryItem.get(socket.socketDefinition.singleInitialItemHash);
    }

    if (toSave && !undesireablePlugs.includes(toSave.plug.plugCategoryHash)) {
      modsAndPerks.push({ plug: toSave, socket });
    }
  }

  return (
    <>
      <div className={'lockedItems'}>
        {modsAndPerks.map((socketAndPlug, index) => (
          <GeneratedSetMod
            key={index}
            gridColumn={(index % 2) + 1}
            plugDef={socketAndPlug.plug}
            defs={defs}
            onClick={() => setSocketInfo(socketAndPlug)}
          />
        ))}
      </div>
      {socketInfo &&
        ReactDOM.createPortal(
          <SocketDetails
            key={socketInfo.socket.socketIndex}
            item={item}
            socket={socketInfo.socket}
            initialSelectedPlug={socketInfo.plug}
            onClose={() => setSocketInfo(null)}
          />,
          document.body
        )}
    </>
  );
}

export default GeneratedSetSockets;
