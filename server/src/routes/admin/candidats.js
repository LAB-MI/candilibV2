import { synchroAurige } from './business/synchro-aurige'

export const importCandidats = async (req, res) => {
  const files = req.files

  if (!files || !files.file) {
    res.status(400).json({
      success: false,
      message: 'Fichier manquant',
    })
    return
  }

  const jsonFile = files.file
  try {
    const result = await synchroAurige(jsonFile.data)
    res.status(200).send({
      fileName: jsonFile.name,
      success: true,
      message: `Le fichier ${jsonFile.name} a été synchronisé.`,
      candidats: result,
    })
  } catch (err) {
    console.error(err) // eslint-disable-line no-console
    return res.status(500).send(err)
  }
}

export const exportCandidats = (req, res) => {}
